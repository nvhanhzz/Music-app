import unidecode from "unidecode";

interface SearchQuery {
    keyword: string;
}

interface SearchResult {
    regex: RegExp;
    keyword: string;
}

const search = (query: SearchQuery): SearchResult => {
    const { keyword } = query;

    let normalizedKeyword = keyword ? unidecode(keyword).toLowerCase() : '';
    normalizedKeyword = normalizedKeyword.replace(/\s+/g, "-").trim();

    const res: SearchResult = {
        regex: new RegExp(normalizedKeyword, "i"),
        keyword: keyword
    };

    return res;
};

export default search;