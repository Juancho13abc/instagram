<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Conversation;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        // gather conversations by conversation_id or by pair
        $messages = Message::where('from_user_id', $userId)
            ->orWhere('to_user_id', $userId)
            ->with(['from.profile','to.profile'])
            ->orderBy('created_at', 'desc')
            ->get();

        $groups = [];
        foreach ($messages as $m) {
            $key = $m->conversation_id ?: ($m->from_user_id < $m->to_user_id ? $m->from_user_id . '_' . $m->to_user_id : $m->to_user_id . '_' . $m->from_user_id);
            if (!isset($groups[$key])) $groups[$key] = [];
            $groups[$key][] = $m;
        }

        $result = array_map(function($msgs) {
            $last = $msgs[0];
            $other = $last->from->id === auth()->id() ? $last->to : $last->from;
            return [
                'conversation_id' => $last->conversation_id,
                'last_message' => $last,
                'participant' => $other
            ];
        }, $groups);

        return array_values($result);
    }
}
