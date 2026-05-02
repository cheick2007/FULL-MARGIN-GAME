import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = 'maguiragacheick2@gmail.com';

export async function POST(req: Request) {
    try {
        const { userEmail } = await req.json();

        // Vérification : seul l'admin peut accéder
        if (userEmail !== ADMIN_EMAIL) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        // Utilisation de la clé service_role pour bypass le RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Compter les utilisateurs
        const { count: userCount } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        // 2. Compter les transactions
        const { count: transCount } = await supabaseAdmin
            .from('transactions')
            .select('*', { count: 'exact', head: true });

        // 3. Liste des utilisateurs
        const { data: users, error: usersError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500);

        // 4. Liste des transactions
        const { data: transactions, error: transError } = await supabaseAdmin
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);

        if (usersError || transError) {
            return NextResponse.json({
                error: usersError?.message || transError?.message,
            }, { status: 500 });
        }

        return NextResponse.json({
            stats: { users: userCount || 0, transactions: transCount || 0 },
            users: users || [],
            transactions: transactions || [],
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
