// components/layout/CommentSection.tsx
'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Comment, Profile } from '../../lib/supabase';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
  postId: string | number;
  initialComments: Comment[];
  currentUser: { id: string; } | null;
  userProfile: Profile | null;
}

export default function CommentSection({ postId, initialComments, currentUser, userProfile }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const handleAddComment = async () => {
    if (!currentUser || !userProfile || !newComment.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: currentUser.id, content: newComment.trim() })
      .select('*, profiles(*)')
      .single();

    if (error) {
      toast.error('Failed to add comment.');
    } else if (data) {
      setComments([...comments, data]);
      setNewComment('');
      toast.success('Comment added!');
    }
  };

  const handleDeleteComment = async (commentId: string | number) => {
    const { error } = await supabase.from('comments').delete().match({ id: commentId, user_id: currentUser?.id });

    if (error) {
      toast.error('Failed to delete comment.');
    } else {
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted.');
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment) return;

    const { data, error } = await supabase
      .from('comments')
      .update({ content: editedContent })
      .match({ id: editingComment.id, user_id: currentUser?.id })
      .select('*, profiles(*)')
      .single();
    
    if (error) {
      toast.error('Failed to update comment.');
    } else if (data) {
      setComments(comments.map(c => c.id === data.id ? data : c));
      setEditingComment(null);
      setEditedContent('');
      toast.success('Comment updated!');
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-2">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={comment.profiles?.avatar_url} alt={comment.profiles?.username} />
              <AvatarFallback>{comment.profiles?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className={`flex-1 p-3 rounded-lg ${comment.user_id === currentUser?.id ? 'bg-blue-50' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">{comment.profiles?.username}</span>
                {currentUser?.id === comment.user_id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingComment(comment); setEditedContent(comment.content); }}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)} className="text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {editingComment?.id === comment.id ? (
                <div className="mt-2">
                  <Input value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="mb-2" />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingComment(null)}>Cancel</Button>
                    <Button size="sm" onClick={handleUpdateComment}>Save</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-800">{comment.content}</p>
              )}
              <span className="text-xs text-gray-500 block text-right mt-1">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        ))}
      </div>
      {currentUser && (
        <div className="mt-4 flex space-x-2 items-center">
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
            className="flex-1 rounded-full px-4 py-2"
          />
          <Button onClick={handleAddComment} className="rounded-full h-10 w-10 p-0" disabled={!newComment.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}