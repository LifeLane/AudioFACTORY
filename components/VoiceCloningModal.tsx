import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, X, Volume2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { cloneVoice } from '../services/elevenLabsService';

interface VoiceCloningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VoiceCloningModal: React.FC<VoiceCloningModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordingSeconds(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !audioBlob) {
      setError("Please provide a voice name and audio sample.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await cloneVoice(name, description, audioBlob);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to clone voice. Please verify your ElevenLabs API key.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                Instant Voice Cloning Studio
              </h2>
              <p className="text-xs text-zinc-500 font-mono">
                Capture your voice timbre to synthesize lines in Multi-Speaker
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-4 bg-white">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 font-mono text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Voice Name *
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-sm text-zinc-900 font-sans focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all placeholder:text-zinc-400"
              placeholder="e.g. Marcus Studio Voice, Alex Narrator"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Voice Timbre & Description
            </label>
            <input 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-sm text-zinc-900 font-sans focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all placeholder:text-zinc-400"
              placeholder="e.g. Warm acoustic resonance, deep broadcast tone, clear pace"
            />
          </div>

          {/* Audio Sample Recording Box */}
          <div className="border border-zinc-200 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 bg-zinc-50">
            <div className="text-center">
              <span className="text-xs font-mono font-bold text-zinc-800 uppercase tracking-wider block">
                Voice Audio Sample
              </span>
              <p className="text-xs text-zinc-500 mt-0.5">
                Record 15–30 seconds of spoken speech or upload a clear WAV/MP3.
              </p>
            </div>

            {/* Recording Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              {!isRecording ? (
                <button 
                  onClick={startRecording}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border border-rose-700 shadow-xs transition-transform active:scale-95"
                >
                  <Mic className="w-4 h-4" /> Start Studio Mic
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
                  className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border border-zinc-950 animate-pulse shadow-xs"
                >
                  <Square className="w-4 h-4 fill-current text-rose-500" /> Stop ({recordingSeconds}s)
                </button>
              )}

              <label className="flex items-center gap-2 bg-white hover:bg-zinc-100 text-zinc-800 px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border border-zinc-200 shadow-2xs cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-zinc-600" /> Upload File
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileUpload}
                  className="hidden" 
                />
              </label>
            </div>

            {/* Live Audio Sample Preview Player */}
            {audioUrl && (
              <div className="w-full mt-2 pt-3 border-t border-zinc-200 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Audio sample ready for cloning</span>
                </div>
                <audio controls src={audioUrl} className="w-full h-8 max-w-sm" />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-mono text-xs font-bold uppercase transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim() || !audioBlob}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-mono text-xs font-bold uppercase tracking-wider border border-rose-700 shadow-xs flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Cloning Voice...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Clone Voice</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
