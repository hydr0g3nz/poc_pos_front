'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { OrderCart } from '@/components/organisms';
import { OrderItemRow } from '@/components/molecules';
import { Text, Button } from '@/components/atoms';
import { OrderWithItems, apiClient } from '@/lib/api';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
export default function OrderDetailPage() {
  const params = useParams();
  
  const router = useRouter();
  const orderId = parseInt(params.id as string);
  
  
  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="mb-4">Order ID: {orderId}</Text>
        </CardContent>
      </Card>
      <Button onClick={() => router.back()}>Back</Button>
    </MainLayout>
  );
}