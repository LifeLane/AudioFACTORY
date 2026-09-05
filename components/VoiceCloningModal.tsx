import React, { useState, useRef } from 'react';
import { Mic, Square, Upload, X } from 'lucide-react';
import { BauhausButton } from './BauhausComponents';
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
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
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
      setAudioBlob(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !audioBlob) {
      setError("Please provide a name and record/upload audio.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await cloneVoice(name, description, audioBlob);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to clone voice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 shadow-lg shadow-black/50 w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900">
          <h2 className="text-xl font-light tracking-widest tracking-tighter">Clone Voice</h2>
          <button onClick={onClose} className="hover:text-rose-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-rose-500 text-white font-light text-sm border border-zinc-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-light tracking-widest mb-1">Voice Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full border border-zinc-800 p-2 font-light outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. My Awesome Voice"
            />
          </div>

          <div>
            <label className="block text-xs font-light tracking-widest mb-1">Description (Optional)</label>
            <input 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-zinc-800 p-2 font-light outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. Deep, energetic, professional"
            />
          </div>

          <div className="border border-dashed border-zinc-800 p-4 flex flex-col items-center justify-center gap-4 bg-zinc-900">
            <div className="text-center">
              <p className="text-sm font-light tracking-widest">Provide Audio Sample</p>
              <p className="text-xs text-zinc-400">Record at least 30 seconds for best results.</p>
            </div>

            <div className="flex gap-4">
              {!isRecording ? (
                <button 
                  onClick={startRecording}
                  className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 font-light tracking-widest border border-zinc-800 hover:-translate-y-1 transition-transform shadow-lg shadow-black/50"
                >
                  <Mic className="w-4 h-4" /> Record
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
                  className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 font-light tracking-widest border border-zinc-800 animate-pulse"
                >
                  <Square className="w-4 h-4" /> Stop
                </button>
              )}

              <label className="flex items-center gap-2 bg-zinc-900 text-zinc-50 px-4 py-2 font-light tracking-widest border border-zinc-800 hover:-translate-y-1 transition-transform shadow-lg shadow-black/50 cursor-pointer">
                <Upload className="w-4 h-4" /> Upload
                <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {audioBlob && (
              <div className="w-full mt-2">
                <audio src={URL.createObjectURL(audioBlob)} controls className="w-full h-8" />
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 font-light tracking-widest text-zinc-400 hover:text-zinc-50"
          >
            Cancel
          </button>
          <BauhausButton 
            onClick={handleSubmit} 
            disabled={isSubmitting || !name.trim() || !audioBlob}
            variant="primary"
          >
            {isSubmitting ? 'Cloning...' : 'Clone Voice'}
          </BauhausButton>
        </div>
      </div>
    </div>
  );
};
