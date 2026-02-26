import React from "react";
import { render, waitFor, screen, act } from "@testing-library/react-native";
import GroupPage from "../src/app/(home)/(tabs)/CreateGroup/GroupPage";

// --- Mocks ---
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ groupId: "test-group-123" }),
  router: { push: jest.fn(), back: jest.fn() },
  Stack: { Screen: () => null },
}));

jest.mock("../src/providers/AuthProvider", () => ({
  useAuth: () => ({ user: { id: "user-abc" } }),
}));

jest.mock("../src/components/ReportMissingButton", () => {
  const { Text } = require("react-native");
  return () => <Text>ReportMissingButton</Text>;
});

// build a chain for eahc to test
const buildChain = () => {
  const chain: any = {
    select: jest.fn(),
    eq: jest.fn(),
    in: jest.fn(),
    maybeSingle: jest.fn(),
    single: jest.fn(),
  };
  // Every method returns the same chain so calls can keep chaining
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.in.mockReturnValue(chain);
  return chain;
};

let mockChain: any;

jest.mock("../src/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => mockChain),
  },
}));

// --- Tests ---
describe("GroupPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChain = buildChain();

    // Set up what the terminal calls resolve with
    mockChain.maybeSingle.mockResolvedValue({
      data: { user_id: "user-abc", group_id: "test-group-123" },
      error: null,
    });

    mockChain.single.mockResolvedValue({
      data: { id: "test-group-123", group_name: "Test House" },
      error: null,
    });

    // group_members query ends at .eq() — override the LAST .eq call to resolve with data
    mockChain.eq
      .mockReturnValue(mockChain)             // first calls keep chaining
      .mockResolvedValueOnce({                // last call in the members query resolves
        data: [
          { user_id: "user-abc", role: "admin" },
          { user_id: "user-xyz", role: "member" },
        ],
        error: null,
      });

    mockChain.in.mockResolvedValue({
      data: [
        { id: "user-abc", username: "Alice" },
        { id: "user-xyz", username: "Bob" },
      ],
      error: null,
    });
  });

  it("shows loading indicator initially", () => {
    // Make maybeSingle hang so loading stays true
    mockChain.maybeSingle.mockReturnValue(new Promise(() => {}));
    render(<GroupPage />);
    expect(screen.getByText("Loading group...")).toBeTruthy();
  });

  it("renders the group name after loading", async () => {
    render(<GroupPage />);
    await waitFor(() => {
      expect(screen.getByText("Test House")).toBeTruthy();
    });
  });

  it("shows access denied if not a member", async () => {
    mockChain.maybeSingle.mockResolvedValue({ data: null, error: null });
    const { Alert } = require("react-native");
    jest.spyOn(Alert, "alert");
    render(<GroupPage />);
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Access Denied",
        "You don't belong to this group."
      );
    });
  });
});