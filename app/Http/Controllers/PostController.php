<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
     public function index()
    {
        // feed simple: últimos posts con user, profile, likes, comments
        return Post::with(['user.profile', 'likes', 'comments.user.profile'])
            ->latest()
            ->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'image' => 'required|image|max:2048',
            'caption' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'is_story' => 'nullable|boolean'
        ]);

        $path = $request->file('image')->store('posts', 'public');

        $post = Post::create([
            'user_id' => $request->user()->id,
            'image' => $path,
            'caption' => $data['caption'] ?? null,
            'location' => $data['location'] ?? null,
            'is_story' => $request->boolean('is_story', false),
        ]);

        return $post->load('user.profile');
    }

    public function show(Post $post)
    {
        return $post->load(['user.profile','comments.user.profile','likes']);
    }

    public function destroy(Post $post, Request $request)
    {
        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message'=>'No autorizado'], 403);
        }

        Storage::disk('public')->delete($post->image);
        $post->delete();
        return response()->json(['message'=>'Eliminado']);
    }
}
