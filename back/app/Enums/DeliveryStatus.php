<?php

namespace App\Enums;

enum DeliveryStatus: string
{
    case Unscheduled = 'unscheduled';
    case Scheduled = 'scheduled';
    case InTransit = 'in_transit';
    case Delivered = 'delivered';
    case Failed = 'failed';
}
