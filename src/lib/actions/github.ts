"use server";

export interface GithubContribution {
  date: string;
  count: number;
  level: number;
}

export async function fetchGithubContributions(username: string): Promise<GithubContribution[][]> {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.warn("No GITHUB_TOKEN configured. Falling back to empty state.");
    return [];
  }

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
    const weeks = data?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;

    if (!weeks) return [];

    // Map the GraphQL response to our expected grid structure
    return weeks.map((week: { contributionDays: { contributionCount: number, date: string, contributionLevel: string }[] }) => 
      week.contributionDays.map((day: { contributionCount: number, date: string, contributionLevel: string }) => {
        // Map GitHub's literal enum to numeric intensity (0-4)
        const levelMap: Record<string, number> = {
          NONE: 0,
          FIRST_QUARTILE: 1,
          SECOND_QUARTILE: 2,
          THIRD_QUARTILE: 3,
          FOURTH_QUARTILE: 4,
        };
        
        return {
          date: day.date,
          count: day.contributionCount,
          level: levelMap[day.contributionLevel] || 0
        };
      })
    );
  } catch (error) {
    console.error("Failed to fetch github data:", error);
    return [];
  }
}
