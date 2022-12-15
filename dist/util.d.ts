export type Octokit = ReturnType<typeof getOctokit>;
export declare function getOctokit(): import("@octokit/core").Octokit & import("@octokit/plugin-rest-endpoint-methods/dist-types/types").Api & {
    paginate: import("@octokit/plugin-paginate-rest").PaginateInterface;
};
export declare function getChangedFiles(octokit: Octokit): Promise<{
    sha: string;
    filename: string;
    status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
    additions: number;
    deletions: number;
    changes: number;
    blob_url: string;
    raw_url: string;
    contents_url: string;
    patch?: string | undefined;
    previous_filename?: string | undefined;
}[]>;
type Annotations = {
    path: string;
    start_line: number;
    end_line: number;
    annotation_level: string;
    message: string;
};
type Conclusion = 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required';
export declare function createCheck(octokit: Octokit, meta: {
    status: 'in_progress' | 'completed' | 'queued';
    conclusion?: Conclusion;
    started_at?: string;
    completed_at?: string;
    output: {
        title: string;
        summary: string;
        annotations?: Annotations[];
    };
}): Promise<import("@octokit/plugin-paginate-rest/dist-types/types").OctokitResponse<{
    id: number;
    head_sha: string;
    node_id: string;
    external_id: string | null;
    url: string;
    html_url: string | null;
    details_url: string | null;
    status: "completed" | "in_progress" | "queued";
    conclusion: "neutral" | "success" | "failure" | "cancelled" | "skipped" | "timed_out" | "action_required" | null;
    started_at: string | null;
    completed_at: string | null;
    output: {
        title: string | null;
        summary: string | null;
        text: string | null;
        annotations_count: number;
        annotations_url: string;
    };
    name: string;
    check_suite: {
        id: number;
    } | null;
    app: {
        id: number;
        slug?: string | undefined;
        node_id: string;
        owner: {
            name?: string | null | undefined;
            email?: string | null | undefined;
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            gravatar_id: string | null;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean;
            starred_at?: string | undefined;
        } | null;
        name: string;
        description: string | null;
        external_url: string;
        html_url: string;
        created_at: string;
        updated_at: string;
        permissions: {
            issues?: string | undefined;
            checks?: string | undefined;
            metadata?: string | undefined;
            contents?: string | undefined;
            deployments?: string | undefined;
        } & {
            [key: string]: string;
        };
        events: string[];
        installations_count?: number | undefined;
        client_id?: string | undefined;
        client_secret?: string | undefined;
        webhook_secret?: string | null | undefined;
        pem?: string | undefined;
    } | null;
    pull_requests: {
        id: number;
        number: number;
        url: string;
        head: {
            ref: string;
            sha: string;
            repo: {
                id: number;
                url: string;
                name: string;
            };
        };
        base: {
            ref: string;
            sha: string;
            repo: {
                id: number;
                url: string;
                name: string;
            };
        };
    }[];
    deployment?: {
        url: string;
        id: number;
        node_id: string;
        task: string;
        original_environment?: string | undefined;
        environment: string;
        description: string | null;
        created_at: string;
        updated_at: string;
        statuses_url: string;
        repository_url: string;
        transient_environment?: boolean | undefined;
        production_environment?: boolean | undefined;
        performed_via_github_app?: {
            id: number;
            slug?: string | undefined;
            node_id: string;
            owner: {
                name?: string | null | undefined;
                email?: string | null | undefined;
                login: string;
                id: number;
                node_id: string;
                avatar_url: string;
                gravatar_id: string | null;
                url: string;
                html_url: string;
                followers_url: string;
                following_url: string;
                gists_url: string;
                starred_url: string;
                subscriptions_url: string;
                organizations_url: string;
                repos_url: string;
                events_url: string;
                received_events_url: string;
                type: string;
                site_admin: boolean;
                starred_at?: string | undefined;
            } | null;
            name: string;
            description: string | null;
            external_url: string;
            html_url: string;
            created_at: string;
            updated_at: string;
            permissions: {
                issues?: string | undefined;
                checks?: string | undefined;
                metadata?: string | undefined;
                contents?: string | undefined;
                deployments?: string | undefined;
            } & {
                [key: string]: string;
            };
            events: string[];
            installations_count?: number | undefined;
            client_id?: string | undefined;
            client_secret?: string | undefined;
            webhook_secret?: string | null | undefined;
            pem?: string | undefined;
        } | null | undefined;
    } | undefined;
}, 201>>;
export declare function spellCheck(octokit: Octokit, check_run_id: number, files: {
    filename: string;
    patch?: string;
}[]): Promise<void>;
export {};
