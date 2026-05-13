<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\FriendshipController;

//Route::get('/user', function (Request $request) {
//    return $request->user();
//})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);

    // users
    Route::get('/users/search', [FriendshipController::class, 'search']);

    // posts
    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/posts/{post}', [PostController::class, 'show']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);

    // comments
    Route::get('/posts/{post}/comments', [CommentController::class, 'index']);
    Route::post('/posts/{post}/comments', [CommentController::class, 'store']);

    // likes
    Route::post('/posts/{post}/like', [LikeController::class, 'like']);
    Route::delete('/posts/{post}/like', [LikeController::class, 'unlike']);

    // friendships
    Route::post('/users/{user}/friend', [FriendshipController::class, 'send']);
    Route::get('/friends', [FriendshipController::class, 'myFriends']);
    Route::post('/friendships/{friendship}/accept', [FriendshipController::class, 'accept']);
    Route::get('/friendships/pending', [FriendshipController::class, 'pending']);

    // user endpoints
    Route::get('/users/{user}', [\App\Http\Controllers\UserController::class, 'show']);
    Route::get('/users/{user}/posts', [\App\Http\Controllers\UserController::class, 'posts']);
    Route::post('/users/{user}/follow', [\App\Http\Controllers\UserController::class, 'follow']);
    Route::delete('/users/{user}/follow', [\App\Http\Controllers\UserController::class, 'unfollow']);
    Route::get('/users/{user}/is_following', [\App\Http\Controllers\UserController::class, 'isFollowing']);

    // profile update
    Route::post('/user', [\App\Http\Controllers\UserController::class, 'updateProfile']);

    // conversations & messages
    Route::get('/conversations', [\App\Http\Controllers\ConversationController::class, 'index']);
    Route::get('/conversations/{conversation}/messages', [\App\Http\Controllers\MessageController::class, 'index']);
    Route::post('/messages', [\App\Http\Controllers\MessageController::class, 'store']);
});

Route::middleware('auth:sanctum')->post('/logout', function (\Illuminate\Http\Request $request) {
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'ok']);
});
