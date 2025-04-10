import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes: number;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      setPosts(data || []);
    };

    fetchPosts();

    // Subscribe to new posts
    const subscription = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLike = async (postId: string) => {
    try {
      await supabase.rpc('increment_likes', { post_id: postId });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article key={post.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-start gap-3">
            <img
              src={post.profiles.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces"}
              alt={post.profiles.username}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{post.profiles.username}</span>
                <span className="text-gray-500 text-sm">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-2">{post.content}</p>
              <div className="flex items-center gap-6 mt-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-500"
                >
                  <Heart size={18} />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500">
                  <MessageCircle size={18} />
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-green-500">
                  <Repeat2 size={18} />
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500">
                  <Share size={18} />
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}