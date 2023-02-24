<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chats.{chat_id}', function ($user, $chat_id) {
    if ($user->chats->contains($chat_id))
        return $user;
});
