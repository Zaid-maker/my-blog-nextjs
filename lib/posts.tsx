import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { remark } from "remark";
import html from "remark-html";

/* Joining the current working directory with the posts directory. */
const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData() {
  /* Reading the directory of the posts and returning the file names. */
  const fileNames = fs.readdirSync(postsDirectory);

  /* Mapping the file names and returning the id and the data from the parsed file. */
  const allPostsData = fileNames.map((fileName) => {
    /* Removing the .md extension from the file name. */
    const id = fileName.replace(/\.md$/, "");

    /* Joining the postsDirectory with the fileName. */
    const fullPath = path.join(postsDirectory, fileName);
    /* Reading the file contents of the file. */
    const fileContents = fs.readFileSync(fullPath, "utf8");

    /* Parsing the file contents and returning the data. */
    const matterResult = matter(fileContents);

    /* Returning the id and the data from the parsed file. */
    return {
      id,
      ...(matterResult.data as { date: string; title: string }),
    };
  });

  /* Sorting the posts by date. */
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  /* Reading the directory of the posts and returning the file names. */
  const fileNames = fs.readdirSync(postsDirectory);

  /* Returning the file names and mapping them to the id. */
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

export async function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}
