<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->items;
        $total = $items->sum(fn($item) => $item->product->price * $item->quantity);

        return [
            'id'          => $this->id,
            'items'       => CartItemResource::collection($this->whenLoaded('items')),
            'items_count' => $items->count(),
            'total'       => (float) $total,
        ];
    }
}
