"use server";

import { parsePublicCalendar, type GithubCalendarData, type GithubContribution } from "@/lib/github-calendar";

export async function fetchGithubContributions(username: string): Promise<GithubCalendarData | null> {
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) return null;
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    const data = await fetchAuthenticatedCalendar(username, token);
    if (data) return data;
  }
  try {
    const result = await fetch("https://github.com/users/" + username + "/contributions", {
      headers: { "Accept-Language": "en-US" },
      signal: AbortSignal.timeout(4500),
      next: { revalidate: 3600 },
    });
    return result.ok ? parsePublicCalendar(await result.text()) : null;
  } catch {
    return null;
  }
}

async function fetchAuthenticatedCalendar(username: string, token: string): Promise<GithubCalendarData | null> {
  const query = `
    query($userName:String!) {
      user(login: $userName){
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      signal: AbortSignal.timeout(4500),
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { userName: username },
      }),
      next: {
        revalidate: 3600, // Cache for 1 hour
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const calendar = data?.data?.user?.contributionsCollection?.contributionCalendar;
    
    if (!calendar || !calendar.weeks) return null;

    const totalContributions = calendar.totalContributions || 0;
    let mostActiveDay: GithubContribution | undefined = undefined;
    let activeWeeksCount = 0;

    const grid = calendar.weeks.map((week: { contributionDays: { contributionCount: number, date: string, contributionLevel: string }[] }) => {
      let weekIsActive = false;
      const days = week.contributionDays.map((day: { contributionCount: number, date: string, contributionLevel: string }) => {
        const levelMap: Record<string, 0 | 1 | 2 | 3 | 4> = {
          NONE: 0,
          FIRST_QUARTILE: 1,
          SECOND_QUARTILE: 2,
          THIRD_QUARTILE: 3,
          FOURTH_QUARTILE: 4,
        };
        
        const mappedDay: GithubContribution = {
          date: day.date,
          count: day.contributionCount,
          level: levelMap[day.contributionLevel] || 0
        };

        if (mappedDay.count > 0) weekIsActive = true;
        if (!mostActiveDay || mappedDay.count > mostActiveDay.count) {
          mostActiveDay = mappedDay;
        }

        return mappedDay;
      });
      if (weekIsActive) activeWeeksCount++;
      return days;
    });

    return {
      grid,
      totalContributions,
      mostActiveDay,
      activeWeeks: activeWeeksCount,
      currentYear: new Date().getFullYear()
    };
  } catch (error) {
    console.error("Failed to fetch github data:", error);
    return null;
  }
}
