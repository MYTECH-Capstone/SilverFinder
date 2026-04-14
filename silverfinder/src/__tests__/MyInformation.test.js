// __tests__/MyInformation.test.js
import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import MyInformationScreen, {
  intervalCheck,
  intervalText,
  profileFieldCheck,
} from "../app/(home)/(tabs)/My Information";
import { useAuth } from "../providers/AuthProvider";

// --- MOCKS ---

jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          username: "Test User",
          race: "Human",
          age: "30",
          gender: "Male",
          height: "5'10",
          weight: "170",
          eye_color: "Brown",
          hair_color: "Black",
          dis_marks: "None",
          blood_type: "O+",
          conditions: "None",
          medications: "None",
          allergies: "None",
          devices: "None",
          physician: "Dr. Smith",
          vehicle_descr: "Blue Toyota",
          plate_number: "ABC123",
          email_interval: 90,
          avatar_url: null,
        },
        error: null,
      }),
      update: jest.fn().mockReturnThis(),
    })),
    storage: {
      from: jest.fn(() => ({
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: "https://fake.url/avatar.jpg" },
        })),
        upload: jest.fn().mockResolvedValue({
          data: { path: "fake/path.jpg" },
          error: null,
        }),
      })),
    },
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

jest.mock("../providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock("../components/ReportMissingButton", () => () => null);

jest.mock(
  "../app/components/Avatar",
  () => ({
    __esModule: true,
    default: () => {
      const React = require("react");
      const { View } = require("react-native");
      return React.createElement(View, null);
    },
    getAvatarUrl: () => null,
  }),
  { virtual: true },
);

jest.mock("@react-native-picker/picker", () => {
  const { View } = require("react-native");
  const Picker = ({ children }) => <View testID="picker">{children}</View>;
  Picker.Item = () => null;
  return { Picker };
});

// --- HELPER FUNCTION TESTS ---
describe("intervalCheck", () => {
  it("returns profile with updated interval", () => {
    const profile = { email_interval: 90 };
    expect(intervalCheck(profile, 30).email_interval).toBe(30);
  });

  it("does not mutate the original profile", () => {
    const profile = { email_interval: 90 };
    intervalCheck(profile, 30);
    expect(profile.email_interval).toBe(90);
  });
});

describe("intervalText", () => {
  it("returns turned off message when interval is 0", () => {
    expect(intervalText(0)).toBe("Reminders are turned off.");
  });

  it("returns default 90 days message when interval is null", () => {
    expect(intervalText(null)).toBe("Your current interval is 90 days.");
  });

  it("returns default 90 days message when interval is undefined", () => {
    expect(intervalText(undefined)).toBe("Your current interval is 90 days.");
  });

  it("returns correct message for 30 days", () => {
    expect(intervalText(30)).toBe("Your current interval is 30 days.");
  });

  it("returns correct message for 180 days", () => {
    expect(intervalText(180)).toBe("Your current interval is 180 days.");
  });
});

describe("profileFieldCheck", () => {
  it("returns empty string for null", () => {
    expect(profileFieldCheck(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(profileFieldCheck(undefined)).toBe("");
  });

  it("returns the value when provided", () => {
    expect(profileFieldCheck("test")).toBe("test");
  });
});

// --- COMPONENT TESTS ---
describe("MyInformationScreen", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      session: { user: { id: "123" } },
    });
  });

  it("renders correctly", async () => {
    const { getByText } = render(<MyInformationScreen />);
    await waitFor(() => {
      expect(getByText("Edit Profile")).toBeTruthy();
    });
  });

  it("displays profile data after loading", async () => {
    const { getByText } = render(<MyInformationScreen />);
    await waitFor(() => {
      expect(getByText("Test User")).toBeTruthy();
      expect(getByText("O+")).toBeTruthy();
      expect(getByText("Blue Toyota")).toBeTruthy();
      expect(getByText("ABC123")).toBeTruthy();
      expect(getByText("Dr. Smith")).toBeTruthy();
    });
  });

  it("displays personal description fields", async () => {
    const { getByText } = render(<MyInformationScreen />);
    await waitFor(() => {
      expect(getByText("Human")).toBeTruthy();
      expect(getByText("30")).toBeTruthy();
      expect(getByText("Brown")).toBeTruthy();
      expect(getByText("Black")).toBeTruthy();
    });
  });

  it("renders correctly when session is null", async () => {
    useAuth.mockReturnValue({ session: null });
    const { getByText } = render(<MyInformationScreen />);
    await waitFor(() => {
      expect(getByText("Edit Profile")).toBeTruthy();
    });
  });
});
