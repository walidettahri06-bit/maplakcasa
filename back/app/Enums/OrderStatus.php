<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case DocumentsReview = 'documents_review';
    case DocumentsCorrection = 'documents_correction';
    case DocumentsValidated = 'documents_validated';
    case InPreparation = 'in_preparation';
    case ReadyForDelivery = 'ready_for_delivery';
    case OutForDelivery = 'out_for_delivery';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
