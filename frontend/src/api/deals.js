import { apiFetch } from "./http";

async function handleResponse(response) {
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            body?.error?.message ||
            body?.message ||
            "Request failed"
        );
    }

    return body;
}

export async function getDeals() {
    const response = await apiFetch("/deals");
    return handleResponse(response);
}

export async function createDeal({
    contactId,
    name,
    amount,
    stage = "new",
}) {
    if (!contactId) {
        throw new Error("Contact ID is required");
    }

    if (!name) {
        throw new Error("Deal name is required");
    }

    if (
        amount === undefined ||
        amount === null ||
        amount === ""
    ) {
        throw new Error("Deal amount is required");
    }

    const response = await apiFetch("/deals", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contactId,
            name,
            amount,
            stage,
        }),
    });

    return handleResponse(response);
}

export async function getDealById(dealId) {
    if (!dealId) {
        throw new Error("Deal ID is required");
    }

    const response = await apiFetch(`/deals/${dealId}`);
    return handleResponse(response);
}

export async function updateDeal(
    dealId,
    {
        name,
        amount,
        stage,
    }
) {
    if (!dealId) {
        throw new Error("Deal ID is required");
    }

    const response = await apiFetch(`/deals/${dealId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            amount,
            stage,
        }),
    });

    return handleResponse(response);
}

export async function deleteDeal(dealId) {
    if (!dealId) {
        throw new Error("Deal ID is required");
    }

    const response = await apiFetch(`/deals/${dealId}`, {
        method: "DELETE",
    });

    return handleResponse(response);
}

export async function updateDealStage(
    dealId,
    stage
) {
    if (!dealId) {
        throw new Error("Deal ID is required");
    }

    if (!stage) {
        throw new Error("Stage is required");
    }

    const response = await apiFetch(
        `/deals/${dealId}/stage`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ stage }),
        }
    );

    return handleResponse(response);
}

export async function getDealHistory(dealId) {
    if (!dealId) {
        throw new Error("Deal ID is required");
    }

    const response = await apiFetch(
        `/deals/${dealId}/history`
    );

    return handleResponse(response);
}

