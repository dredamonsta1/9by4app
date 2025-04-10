import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Image, Send } from 'lucide-react';

export function CreatePost() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      await supabase.from('posts').insert([
        {
          content,
          user_id: user?.id,
        },
      ]);
      setContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex gap-4">
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces"
          alt="Profile"
          className="w-8 h-8 rounded-full"
        />
        <div className="flex-1">
          <textarea
            className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div className="flex justify-between items-center mt-2">
            <button
              type="button"
              className="text-blue-500 hover:text-blue-600"
              onClick={() => {/* TODO: Implement image upload */}}
            >
              <Image size={20} />
            </button>
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={16} />
              <span>Post</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}