-- =============================================================
-- 0014: Procurement schema — RLS policies + updated_at triggers
-- =============================================================

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE procurement.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.suppliers
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE procurement.procurement_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.procurement_plans
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE procurement.procurement_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.procurement_plan_items
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE procurement.purchase_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.purchase_requests
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE procurement.purchase_request_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.purchase_request_items
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE procurement.rfqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.rfqs
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE procurement.rfq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.rfq_items
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE procurement.rfq_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.rfq_responses
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE procurement.bid_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.bid_evaluations
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE procurement.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.purchase_orders
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE procurement.po_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.po_items
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE procurement.goods_received_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.goods_received_notes
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE procurement.grn_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.grn_items
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE procurement.supplier_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.supplier_invoices
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE procurement.payment_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON procurement.payment_requests
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ── updated_at triggers (all 15 tables are auditable) ────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.suppliers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.procurement_plans
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.procurement_plan_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.purchase_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.purchase_request_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.rfqs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.rfq_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.rfq_responses
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.bid_evaluations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.purchase_orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.po_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.goods_received_notes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.grn_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.supplier_invoices
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON procurement.payment_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
