interface ApiRequestOptions extends Omit<RequestInit, "body"> {
    body?: unknown;
}

function getApiUrl(path: string): string {
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    if (path.startsWith("/api/")) {
        return path;
    }

    if (path.startsWith("/")) {
        return `/api${path}`;
    }

    return `/api/${path}`;
}

async function getApiErrorMessage(response: Response): Promise<string> {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        return response.statusText || "Error al consumir la API";
    }

    const data: unknown = await response.json();
    if (!data || typeof data !== "object") {
        return "Error al consumir la API";
    }

    if ("issues" in data && Array.isArray(data.issues) && data.issues.length > 0) {
        const firstIssue = data.issues[0];
        if (
            firstIssue &&
            typeof firstIssue === "object" &&
            "message" in firstIssue &&
            typeof firstIssue.message === "string"
        ) {
            return firstIssue.message;
        }
    }

    if ("message" in data && typeof data.message === "string") {
        return data.message;
    }

    if ("error" in data && typeof data.error === "string") {
        return data.error;
    }

    return "Error al consumir la API";
}

export async function ApiCall<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
    const { body, ...requestOptions } = options;

    const response = await fetch(getApiUrl(path), {
        ...requestOptions,
        headers: {
            "Content-Type": "application/json",
            ...requestOptions.headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response));
    }

    return response.json() as Promise<TResponse>;
}
