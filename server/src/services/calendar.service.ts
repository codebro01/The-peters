import { google } from "googleapis";

// Initialize the Google Calendar API
const calendar = google.calendar("v3");

export const createConsultationMeeting = async (
  startTime: Date,
  endTime: Date,
  userEmail: string,
  topic: string
) => {
  try {
    // Determine how we are authenticating:
    // Option 1: Service Account (Recommended for server-to-server)
    // Option 2: OAuth2 Client (If generating tokens manually)

    // Using OAuth2 as an example here. You'll need client_id, client_secret, direct refresh_token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const event = {
      summary: `Consultation: ${topic}`,
      description: "Consultation booked via The Peters Agriculture website.",
      start: {
        dateTime: startTime.toISOString(),
      },
      end: {
        dateTime: endTime.toISOString(),
      },
      attendees: [{ email: userEmail }],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`, // unique ID
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    };

    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1, // Required to get Google Meet generated
    });

    return {
      meetingLink: response.data.hangoutLink,
      eventId: response.data.id,
    };
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    throw new Error("Failed to generate meeting link");
  }
};
