-- ============================================================
-- Safe Credit Update RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_update_credits(
    target_user_id UUID,
    admin_id UUID,
    amount_change INTEGER,
    reason_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_role TEXT;
    admin_role TEXT;
    prev_balance INTEGER;
    new_bal INTEGER;
    v_audit_id UUID;
    v_history_id UUID;
BEGIN
    -- Validate admin role
    SELECT role INTO admin_role FROM public.profiles WHERE id = admin_id;
    IF admin_role NOT IN ('admin', 'super_admin') THEN
        RAISE EXCEPTION 'Unauthorized: Must be admin or super_admin';
    END IF;

    -- Lock row for update
    SELECT credits, role INTO prev_balance, target_role 
    FROM public.profiles 
    WHERE id = target_user_id 
    FOR UPDATE;

    IF prev_balance IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    new_bal := prev_balance + amount_change;

    -- Prevent negative balance (unless it's an explicit setting override, but here we require non-negative)
    IF new_bal < 0 THEN
        RAISE EXCEPTION 'Cannot result in negative balance';
    END IF;

    -- Update profile
    UPDATE public.profiles 
    SET credits = new_bal, updated_at = NOW() 
    WHERE id = target_user_id;

    -- Insert credit_history record
    INSERT INTO public.credit_history (user_id, admin_id, change_amount, previous_balance, new_balance, reason)
    VALUES (target_user_id, admin_id, amount_change, prev_balance, new_bal, reason_text)
    RETURNING id INTO v_history_id;

    -- Insert audit log
    INSERT INTO public.audit_logs (admin_id, action_type, entity_type, entity_id, previous_data, new_data)
    VALUES (
        admin_id, 
        'UPDATE_CREDITS', 
        'profile', 
        target_user_id::TEXT, 
        jsonb_build_object('credits', prev_balance), 
        jsonb_build_object('credits', new_bal)
    )
    RETURNING id INTO v_audit_id;

    RETURN jsonb_build_object(
        'success', true, 
        'new_balance', new_bal,
        'history_id', v_history_id
    );
END;
$$;
