package com.audiofactory.app.billing;

import android.app.Activity;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.AcknowledgePurchaseResponseListener;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.ConsumeResponseListener;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.ProductDetailsResponseListener;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesResponseListener;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AudioFACTORY Google Play Billing Native Capacitor Bridge
 * Manages Google Play Billing Client v6+, purchase flow lifecycle, token extraction, and query operations.
 */
@CapacitorPlugin(name = "GooglePlayBilling")
public class GooglePlayBillingPlugin extends Plugin implements PurchasesUpdatedListener, BillingClientStateListener {

    private static final String TAG = "AudioFACTORY_Billing";

    private BillingClient billingClient;
    private boolean isConnected = false;
    private final Map<String, ProductDetails> productDetailsCache = new HashMap<>();
    private PluginCall activePurchaseCall = null;

    @Override
    public void load() {
        super.load();
        initBillingClient();
    }

    private synchronized void initBillingClient() {
        if (billingClient == null) {
            billingClient = BillingClient.newBuilder(getContext())
                    .setListener(this)
                    .enablePendingPurchases()
                    .build();
            connectToBillingService(null);
        }
    }

    private void connectToBillingService(@Nullable final Runnable onConnectedCallback) {
        if (billingClient == null) {
            return;
        }

        if (isConnected) {
            if (onConnectedCallback != null) {
                onConnectedCallback.run();
            }
            return;
        }

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult billingResult) {
                int responseCode = billingResult.getResponseCode();
                if (responseCode == BillingClient.BillingResponseCode.OK) {
                    Log.i(TAG, "Google Play Billing Client connected successfully.");
                    isConnected = true;
                    if (onConnectedCallback != null) {
                        onConnectedCallback.run();
                    }
                } else {
                    Log.e(TAG, "Google Play Billing setup failed with code: " + responseCode + " - " + billingResult.getDebugMessage());
                    isConnected = false;
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                Log.w(TAG, "Google Play Billing Service disconnected. Will reconnect on next request.");
                isConnected = false;
            }
        });
    }

    @Override
    public void onBillingSetupFinished(@NonNull BillingResult billingResult) {
        // Handled in connectToBillingService
    }

    @Override
    public void onBillingServiceDisconnected() {
        isConnected = false;
    }

    /**
     * Handles Google Play Billing Purchases Updated callback
     */
    @Override
    public void onPurchasesUpdated(@NonNull BillingResult billingResult, @Nullable List<Purchase> purchases) {
        int responseCode = billingResult.getResponseCode();
        Log.i(TAG, "onPurchasesUpdated responseCode: " + responseCode);

        if (responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            JSArray purchasesArray = new JSArray();
            for (Purchase purchase : purchases) {
                JSObject purchaseObj = new JSObject();
                purchaseObj.put("orderId", purchase.getOrderId());
                purchaseObj.put("purchaseToken", purchase.getPurchaseToken());
                purchaseObj.put("purchaseTime", purchase.getPurchaseTime());
                purchaseObj.put("purchaseState", purchase.getPurchaseState());
                purchaseObj.put("isAcknowledged", purchase.isAcknowledged());
                purchaseObj.put("isAutoRenewing", purchase.isAutoRenewing());
                purchaseObj.put("packageName", purchase.getPackageName());

                JSArray products = new JSArray();
                for (String p : purchase.getProducts()) {
                    products.put(p);
                }
                purchaseObj.put("products", products);
                purchasesArray.put(purchaseObj);
            }

            JSObject notifyObj = new JSObject();
            notifyObj.put("purchases", purchasesArray);
            notifyListeners("onPurchasesUpdated", notifyObj);

            if (activePurchaseCall != null) {
                JSObject result = new JSObject();
                result.put("success", true);
                result.put("purchases", purchasesArray);
                activePurchaseCall.resolve(result);
                activePurchaseCall = null;
            }
        } else if (responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            Log.i(TAG, "User canceled the Google Play purchase flow.");
            if (activePurchaseCall != null) {
                activePurchaseCall.reject("USER_CANCELED", String.valueOf(responseCode));
                activePurchaseCall = null;
            }
        } else {
            Log.e(TAG, "Purchase failed: " + billingResult.getDebugMessage() + " (code: " + responseCode + ")");
            if (activePurchaseCall != null) {
                activePurchaseCall.reject(billingResult.getDebugMessage(), String.valueOf(responseCode));
                activePurchaseCall = null;
            }
        }
    }

    @PluginMethod
    public void initializeBilling(final PluginCall call) {
        connectToBillingService(new Runnable() {
            @Override
            public void run() {
                JSObject result = new JSObject();
                result.put("connected", true);
                call.resolve(result);
            }
        });
    }

    @PluginMethod
    public void queryProductDetails(final PluginCall call) {
        connectToBillingService(new Runnable() {
            @Override
            public void run() {
                List<QueryProductDetailsParams.Product> productList = new ArrayList<>();

                // Subscriptions
                productList.add(QueryProductDetailsParams.Product.newBuilder()
                        .setProductId("audiofactory_pro_monthly")
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build());
                productList.add(QueryProductDetailsParams.Product.newBuilder()
                        .setProductId("audiofactory_pro_annual")
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build());

                // In-App One-Time Lifetime Product
                productList.add(QueryProductDetailsParams.Product.newBuilder()
                        .setProductId("audiofactory_lifetime")
                        .setProductType(BillingClient.ProductType.INAPP)
                        .build());

                QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                        .setProductList(productList)
                        .build();

                billingClient.queryProductDetailsAsync(params, new ProductDetailsResponseListener() {
                    @Override
                    public void onProductDetailsResponse(@NonNull BillingResult billingResult, @NonNull List<ProductDetails> productDetailsList) {
                        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                            JSArray productsArray = new JSArray();
                            for (ProductDetails details : productDetailsList) {
                                productDetailsCache.put(details.getProductId(), details);

                                JSObject obj = new JSObject();
                                obj.put("productId", details.getProductId());
                                obj.put("title", details.getTitle());
                                obj.put("description", details.getDescription());
                                obj.put("productType", details.getProductType());

                                if (details.getSubscriptionOfferDetails() != null && !details.getSubscriptionOfferDetails().isEmpty()) {
                                    ProductDetails.SubscriptionOfferDetails offer = details.getSubscriptionOfferDetails().get(0);
                                    obj.put("offerToken", offer.getOfferToken());
                                    if (offer.getPricingPhases().getPricingPhaseList().size() > 0) {
                                        ProductDetails.PricingPhase phase = offer.getPricingPhases().getPricingPhaseList().get(0);
                                        obj.put("formattedPrice", phase.getFormattedPrice());
                                        obj.put("priceAmountMicros", phase.getPriceAmountMicros());
                                        obj.put("priceCurrencyCode", phase.getPriceCurrencyCode());
                                    }
                                } else if (details.getOneTimePurchaseOfferDetails() != null) {
                                    ProductDetails.OneTimePurchaseOfferDetails offer = details.getOneTimePurchaseOfferDetails();
                                    obj.put("formattedPrice", offer.getFormattedPrice());
                                    obj.put("priceAmountMicros", offer.getPriceAmountMicros());
                                    obj.put("priceCurrencyCode", offer.getPriceCurrencyCode());
                                }

                                productsArray.put(obj);
                            }

                            JSObject result = new JSObject();
                            result.put("products", productsArray);
                            call.resolve(result);
                        } else {
                            call.reject("Failed to query product details: " + billingResult.getDebugMessage());
                        }
                    }
                });
            }
        });
    }

    @PluginMethod
    public void launchPurchaseFlow(final PluginCall call) {
        final String productId = call.getString("productId");
        final String obfuscatedAccountId = call.getString("obfuscatedAccountId");

        if (productId == null || productId.isEmpty()) {
            call.reject("productId is required");
            return;
        }

        connectToBillingService(new Runnable() {
            @Override
            public void run() {
                ProductDetails details = productDetailsCache.get(productId);
                if (details == null) {
                    // Query if not cached
                    List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
                    String productType = productId.contains("lifetime") ? BillingClient.ProductType.INAPP : BillingClient.ProductType.SUBS;

                    productList.add(QueryProductDetailsParams.Product.newBuilder()
                            .setProductId(productId)
                            .setProductType(productType)
                            .build());

                    QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                            .setProductList(productList)
                            .build();

                    billingClient.queryProductDetailsAsync(params, new ProductDetailsResponseListener() {
                        @Override
                        public void onProductDetailsResponse(@NonNull BillingResult billingResult, @NonNull List<ProductDetails> list) {
                            if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && !list.isEmpty()) {
                                ProductDetails found = list.get(0);
                                productDetailsCache.put(productId, found);
                                executePurchaseFlow(found, obfuscatedAccountId, call);
                            } else {
                                call.reject("Product not found in Google Play Console catalog: " + productId);
                            }
                        }
                    });
                } else {
                    executePurchaseFlow(details, obfuscatedAccountId, call);
                }
            }
        });
    }

    private void executePurchaseFlow(ProductDetails details, @Nullable String obfuscatedAccountId, final PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity unavailable for launchBillingFlow");
            return;
        }

        List<BillingFlowParams.ProductDetailsParams> productDetailsParamsList = new ArrayList<>();
        BillingFlowParams.ProductDetailsParams.Builder builder = BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(details);

        if (details.getProductType().equals(BillingClient.ProductType.SUBS) &&
                details.getSubscriptionOfferDetails() != null &&
                !details.getSubscriptionOfferDetails().isEmpty()) {
            builder.setOfferToken(details.getSubscriptionOfferDetails().get(0).getOfferToken());
        }

        productDetailsParamsList.add(builder.build());

        BillingFlowParams.Builder flowParamsBuilder = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(productDetailsParamsList);

        if (obfuscatedAccountId != null && !obfuscatedAccountId.isEmpty()) {
            flowParamsBuilder.setObfuscatedAccountId(obfuscatedAccountId);
        }

        activePurchaseCall = call;
        BillingResult result = billingClient.launchBillingFlow(activity, flowParamsBuilder.build());

        if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
            activePurchaseCall = null;
            call.reject("Failed to launch billing flow: " + result.getDebugMessage());
        }
    }

    @PluginMethod
    public void restorePurchases(final PluginCall call) {
        connectToBillingService(new Runnable() {
            @Override
            public void run() {
                final JSArray allPurchases = new JSArray();

                // 1. Query active subscriptions
                QueryPurchasesParams subsParams = QueryPurchasesParams.newBuilder()
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build();

                billingClient.queryPurchasesAsync(subsParams, new PurchasesResponseListener() {
                    @Override
                    public void onQueryPurchasesResponse(@NonNull BillingResult subsResult, @NonNull List<Purchase> subsPurchases) {
                        if (subsResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                            for (Purchase p : subsPurchases) {
                                allPurchases.put(formatPurchaseObject(p));
                            }
                        }

                        // 2. Query in-app products (lifetime)
                        QueryPurchasesParams inAppParams = QueryPurchasesParams.newBuilder()
                                .setProductType(BillingClient.ProductType.INAPP)
                                .build();

                        billingClient.queryPurchasesAsync(inAppParams, new PurchasesResponseListener() {
                            @Override
                            public void onQueryPurchasesResponse(@NonNull BillingResult inAppResult, @NonNull List<Purchase> inAppPurchases) {
                                if (inAppResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                                    for (Purchase p : inAppPurchases) {
                                        allPurchases.put(formatPurchaseObject(p));
                                    }
                                }

                                JSObject result = new JSObject();
                                result.put("success", true);
                                result.put("purchases", allPurchases);
                                call.resolve(result);
                            }
                        });
                    }
                });
            }
        });
    }

    private JSObject formatPurchaseObject(Purchase purchase) {
        JSObject obj = new JSObject();
        obj.put("orderId", purchase.getOrderId());
        obj.put("purchaseToken", purchase.getPurchaseToken());
        obj.put("purchaseTime", purchase.getPurchaseTime());
        obj.put("purchaseState", purchase.getPurchaseState());
        obj.put("isAcknowledged", purchase.isAcknowledged());
        obj.put("isAutoRenewing", purchase.isAutoRenewing());
        obj.put("packageName", purchase.getPackageName());

        JSArray products = new JSArray();
        for (String p : purchase.getProducts()) {
            products.put(p);
        }
        obj.put("products", products);
        if (purchase.getProducts().size() > 0) {
            obj.put("productId", purchase.getProducts().get(0));
        }
        return obj;
    }

    @PluginMethod
    public void acknowledgePurchase(final PluginCall call) {
        final String purchaseToken = call.getString("purchaseToken");
        if (purchaseToken == null || purchaseToken.isEmpty()) {
            call.reject("purchaseToken is required");
            return;
        }

        connectToBillingService(new Runnable() {
            @Override
            public void run() {
                AcknowledgePurchaseParams params = AcknowledgePurchaseParams.newBuilder()
                        .setPurchaseToken(purchaseToken)
                        .build();

                billingClient.acknowledgePurchase(params, new AcknowledgePurchaseResponseListener() {
                    @Override
                    public void onAcknowledgePurchaseResponse(@NonNull BillingResult billingResult) {
                        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                            JSObject res = new JSObject();
                            res.put("acknowledged", true);
                            call.resolve(res);
                        } else {
                            call.reject("Acknowledge failed: " + billingResult.getDebugMessage());
                        }
                    }
                });
            }
        });
    }
}
