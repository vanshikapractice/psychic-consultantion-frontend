import { createAction } from "@reduxjs/toolkit";

/**
 * Shared action dispatched on logout to reset every user-specific Redux
 * slice back to its initial state. Slices opt in by handling this action
 * through `extraReducers`.
 */
export const resetApp = createAction("app/reset");