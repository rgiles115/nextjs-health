import NextAuth from "next-auth"
import Providers from "next-auth/providers"

export default NextAuth({
  providers: [
    Providers.Strava({
      clientId: process.env.STRAVA_CLIENT_ID,
      clientSecret: process.env.STRAVA_CLIENT_SECRET,
      authorization: {
        params: { scope: "read,activity:read" } // Adjust scope as per your requirement
      }
    })
  ]
})
