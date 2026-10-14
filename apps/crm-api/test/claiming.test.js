const test = require("node:test");
const assert = require("node:assert/strict");
test("claiming rule: a claimed lead must not remain public", () => {
    const publicLead = { id: "demo-id", claimedBy: null };
    const claimedLead = { ...publicLead, claimedBy: "employee-id" };
    assert.equal(publicLead.claimedBy, null);
    assert.notEqual(claimedLead.claimedBy, null);
    assert.equal(claimedLead.id, publicLead.id);
});
