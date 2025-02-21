DO $$
DECLARE
    user_uuid UUID;
    report_uuid UUID;
BEGIN
    -- Retrieve the test user's UUID from temp_user
    SELECT id INTO user_uuid FROM temp_user LIMIT 1;

    -- Generate a valid UUID for the financial report
    report_uuid := extensions.uuid_generate_v4();

    -- Insert Sample Financial Report
    INSERT INTO public.financial_reports (id, user_id, report_type, report_date, file_path)
    VALUES (
        report_uuid,
        user_uuid,
        'P&L',
        NOW() - INTERVAL '30 days',
        '/reports/pnl_march_2025.pdf'
    );
END $$;
