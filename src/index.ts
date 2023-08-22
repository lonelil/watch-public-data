import axios from "axios";
import { readFileSync, writeFileSync } from "fs";

type Sections = {
  title: string;
  data: string[];
};

const data = JSON.parse(readFileSync("./data.json", "utf8"));

console.log(`Got ${data.length} sections.`);

syncWithTMDB();

async function syncWithTMDB() {
  const movies: any = await Promise.all(
    data.map(async (section: Sections) => {
      console.log(section);
      const movieList: any[] = [];
      await Promise.all(
        section.data.map(async (movie: string) => {
          const { data } = await axios.get(
            "https://api.themoviedb.org/3/search/movie",
            {
              params: {
                query: movie,
                include_adult: false,
                language: "en-US",
                api_key: "c4a0f1943427fb35334f6df365d391d6",
              },
            }
          );

          const movieData = data.results[0];

          if (!movieData) return null;

          console.log(
            `${section.title}: Matched ${movie} with ${movieData.title} (${movieData.id})`
          );

          movieList.push(movieData);
        })
      );

      return {
        title: section.title,
        data: movieList,
      };
    })
  );

  console.log(movies);

  writeFileSync("./data.json", JSON.stringify(movies));
}
