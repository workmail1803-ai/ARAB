import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth, jsonResponse } from '@/lib/api-middleware';

// Prevent static generation
export const dynamic = 'force-dynamic';

// GET /api/v1/analytics/kpis - Get dashboard KPIs
async function handleGet(request: NextRequest, companyId: string) {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const period = searchParams.get('period') || 'today';

    // Calculate date range
    let startDate: Date;
    const endDate = new Date();

    switch (period) {
        case 'today':
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'yesterday':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
            startDate.setHours(0, 0, 0, 0);
            endDate.setDate(endDate.getDate() - 1);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'last_7_days':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'last_30_days':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            break;
        case 'this_month':
            startDate = new Date();
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            break;
        default:
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
    }

    // Get total orders
    const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    // Get delivered orders
    const { count: deliveredOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'delivered')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    // Get pending orders
    const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'pending')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    // Get revenue
    const { data: revenueData } = await supabase
        .from('orders')
        .select('total')
        .eq('company_id', companyId)
        .eq('status', 'delivered')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    const revenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    // Get active riders
    const { count: activeRiders } = await supabase
        .from('riders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .in('status', ['active', 'busy']);

    // Get total riders
    const { count: totalRiders } = await supabase
        .from('riders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

    // Get total customers
    const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

    // Calculate delivery rate
    const deliveryRate = totalOrders && totalOrders > 0
        ? Math.round(((deliveredOrders || 0) / totalOrders) * 100 * 10) / 10
        : 0;

    // Calculate average order value
    const avgOrderValue = deliveredOrders && deliveredOrders > 0
        ? Math.round((revenue / deliveredOrders) * 100) / 100
        : 0;

    return jsonResponse({
        success: true,
        data: {
            period,
            total_orders: totalOrders || 0,
            delivered_orders: deliveredOrders || 0,
            pending_orders: pendingOrders || 0,
            revenue: Math.round(revenue * 100) / 100,
            active_riders: activeRiders || 0,
            total_riders: totalRiders || 0,
            total_customers: totalCustomers || 0,
            delivery_rate: deliveryRate,
            avg_order_value: avgOrderValue,
        },
    });
}

export async function GET(request: NextRequest) {
    return withAuth(request, handleGet);
}
