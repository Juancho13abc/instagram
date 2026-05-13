<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Conversation;

class MessageController extends Controller
{
    public function index(Request $request, $conversationId)
    {
        return Message::where('conversation_id', $conversationId)
            ->with(['from.profile','to.profile'])
            ->orderBy('created_at')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'to_user_id' => 'required|exists:users,id',
            'content' => 'required|string'
        ]);

        $from = $request->user()->id;
        $to = $data['to_user_id'];

        // try to find existing conversation
        $conv = Conversation::whereHas('messages', function($q) use ($from, $to) {
            $q->where(function($qq) use ($from, $to) {
                $qq->where('from_user_id', $from)->where('to_user_id', $to);
            })->orWhere(function($qq) use ($from, $to) {
                $qq->where('from_user_id', $to)->where('to_user_id', $from);
            });
        })->first();

        if (! $conv) {
            $conv = Conversation::create();
        }

        $msg = Message::create([
            'conversation_id' => $conv->id,
            'from_user_id' => $from,
            'to_user_id' => $to,
            'content' => $data['content']
        ]);

        return $msg->load('from.profile','to.profile');
    }
}
