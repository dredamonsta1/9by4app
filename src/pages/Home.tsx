import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { Heart } from 'lucide-react';
import { useAuth } from '../components/AuthContext/AuthContext';
import type { Database } from '../types/supabase';
import type UserProfile from '../components/userProfile/UserProfile';


type Post = UserProfile['public']['Tables']['posts']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
  likes: Database['public']['Tables']['likes']['Row'][];
};

export function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
    
    const postsSubscription = supabase
      .channel('posts_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      postsSubscription.unsubscribe();
    };
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          ),
          likes (
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) return;

    const isLiked = posts.find(p => p.id === postId)?.likes.some(l => l.user_id === user.id);

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });
      }

      await fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-start gap-3">
            <Link to={`/profile/${post.profiles.username}`}>
              <img
                src={post.profiles.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${post.profiles.username}`}
                alt={post.profiles.username}
                className="w-10 h-10 rounded-full"
              />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/profile/${post.profiles.username}`}
                  className="font-semibold hover:underline"
                >
                  {post.profiles.display_name}
                </Link>
                <span className="text-gray-500">@{post.profiles.username}</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">{formatDate(post.created_at)}</span>
              </div>
              <p className="mt-2 text-gray-900">{post.content}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1 text-sm ${
                    post.likes.some(l => l.user_id === user?.id)
                      ? 'text-red-500'
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>{post.likes.length}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}