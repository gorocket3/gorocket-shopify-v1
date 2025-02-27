<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class MessageCompleted implements ShouldBroadcastNow
{
    /**
     * The number of times the job may be attempted.
     */
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @var mixed
     */
    public string $shopId;
    public string $action;
    public ?array $data;

    /**
     * Create a new event instance.
     *
     * @param string $shopId
     * @param string $action
     * @param array|null $data
     */
    public function __construct(string $shopId, string $action, ?array $data = [])
    {
        $this->shopId = $shopId;
        $this->action = $action;
        $this->data = $data;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel
     */
    public function broadcastOn(): Channel
    {
        return new Channel('gorocket-shop-' . $this->shopId);
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'shop_id' => $this->shopId,
            'action' => $this->action,
            'data' => $this->data
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return $this->action;
    }
}

