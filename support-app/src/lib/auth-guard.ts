import { redirect } from "@tanstack/react-router";

export interface User {
	id: string;
	name: string;
	email: string;
	role: "admin" | "user" | "support";
	avatar?: string;
}

/**
 * Check if user is authenticated by looking for stored user in localStorage
 */
export function isAuthenticated(): boolean {
	try {
		const userStr = localStorage.getItem("support-user");
		const token = localStorage.getItem("token");
		return !!userStr && !!token;
	} catch {
		return false;
	}
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
	try {
		const userStr = localStorage.getItem("support-user");
		if (!userStr) return null;
		return JSON.parse(userStr) as User;
	} catch {
		return null;
	}
}

/**
 * Check if user has required role(s)
 */
export function hasRole(requiredRoles: string | string[]): boolean {
	const user = getCurrentUser();
	if (!user) return false;

	const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
	return roles.includes(user.role);
}

/**
 * Auth guard to protect routes - redirects to login if not authenticated
 */
export function requireAuth() {
	if (!isAuthenticated()) {
		throw redirect({
			to: "/login",
			search: {
				// Save the current location to redirect back after login
				redirect: window.location.pathname,
			},
		});
	}
	return getCurrentUser();
}

/**
 * Auth guard for admin-only routes
 */
export function requireAdmin() {
	const user = requireAuth();
	if (user?.role !== "admin" && user?.role !== "support") {
		throw redirect({
			to: "/dashboard",
		});
	}
	return user;
}

/**
 * Auth guard for user-only routes
 */
export function requireUser() {
	const user = requireAuth();
	if (user?.role !== "user") {
		throw redirect({
			to: "/dashboard",
		});
	}
	return user;
}

/**
 * Redirect authenticated users away from auth pages (login/signup)
 */
export function redirectIfAuthenticated() {
	if (isAuthenticated()) {
		throw redirect({ to: "/dashboard" });
	}
}
