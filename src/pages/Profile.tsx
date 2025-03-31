import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import { useAuth } from '../components/AuthContext/AuthContext';
import type { Database } from '../types/supabase';
import UserProfile from '../components/userProfile/UserProfile';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];

export function Profile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!username) return;

    async function fetchProfileAndPosts() {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndPosts();
  }, [username]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  const isOwnProfile = user?.id === profile.id;

  return (
    <div>
      <div className="bg-white p-6 rounded-xl shadow mb-4">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`}
            alt={profile.username}
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{profile.display_name}</h1>
            <p className="text-gray-500">@{profile.username}</p>
            {profile.bio && (
              <p className="mt-2 text-gray-700">{profile.bio}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Joined {formatDate(profile.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{profile.display_name}</span>
              <span className="text-gray-500">@{profile.username}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">{formatDate(post.created_at)}</span>
            </div>
            <p className="text-gray-900">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}