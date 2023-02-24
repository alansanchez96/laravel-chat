<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Chat;

class MessageController extends Controller
{
    public function sent(Request $request)
    {
        $message = auth()->user()->messages()->create([
            'content' => $request->message,
            'chat_id' => $request->chat_id,
        ])->load('user');

        broadcast(new MessageSent($message))->toOthers();

        return $message;
    }

    public function getMessages(Chat $chat)
    {
        $messages = $chat->messages()->with('user')->get();
        
        return response()->json([
            'messages' => $messages
        ]);
    }
}
