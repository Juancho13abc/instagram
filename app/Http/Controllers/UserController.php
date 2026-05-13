<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Friendship;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function show(User $user)
    {
        return $user->load('profile');
    }

    public function posts(User $user)
    {
        return $user->posts()->with('user.profile','likes','comments.user.profile')->latest()->get();
    }

    public function follow(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) return response()->json(['message'=>'No autorizado'], 400);

        $f = Friendship::updateOrCreate([
            'user_id' => $request->user()->id,
            'friend_id' => $user->id
        ], ['status' => 'accepted']);

        return response()->json(['message'=>'ok','friendship'=>$f]);
    }

    public function unfollow(Request $request, User $user)
    {
        Friendship::where(function($q) use ($request, $user) {
            $q->where('user_id', $request->user()->id)->where('friend_id', $user->id);
        })->orWhere(function($q) use ($request, $user) {
            $q->where('user_id', $user->id)->where('friend_id', $request->user()->id);
        })->delete();

        return response()->json(['message'=>'ok']);
    }

    public function isFollowing(Request $request, User $user)
    {
        $exists = Friendship::where('user_id', $request->user()->id)
            ->where('friend_id', $user->id)
            ->where('status','accepted')
            ->exists();

        return ['following' => $exists];
    }

    public function updateProfile(Request $request)
    {
        $u = $request->user();

        $data = $request->validate([
            'name' => 'nullable|string',
            'username' => 'nullable|string|unique:profiles,username,' . ($u->profile?->id ?? 'NULL') . ',id',
            'bio' => 'nullable|string',
            'avatar' => 'nullable|image|max:2048'
        ]);

        if (isset($data['name'])) $u->update(['name'=>$data['name']]);

        $profile = $u->profile ?: $u->profile()->create([]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars','public');
            $profile->avatar = $path;
        }

        if (isset($data['username'])) $profile->username = $data['username'];
        if (isset($data['bio'])) $profile->bio = $data['bio'];

        $profile->save();

        return $u->load('profile');
    }
}
