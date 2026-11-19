// The filtering function (case-insensitive; safely matches strings and primitive properties)
export const search = (mainData: any, inputData: string) => {
  const query = inputData?.toLowerCase().trim() || "";
  if (!query || !Array.isArray(mainData)) return mainData;

  return mainData.filter((item: any) => {
    if (!item || typeof item !== "object") return false;

    // Check high-priority string fields if present
    const fieldsToSearch = [
      item.name,
      item.channel_name,
      item.topic,
      item.description,
      item.email,
      item.username,
      item.user_name,
    ].filter(Boolean);

    if (fieldsToSearch.length > 0) {
      return fieldsToSearch.some((val) =>
        String(val).toLowerCase().includes(query)
      );
    }

    return Object.entries(item).some(([_, val]) => {
      if (typeof val === "string" || typeof val === "number") {
        return String(val).toLowerCase().includes(query);
      }
      return false;
    });
  });
};

export const FilterMethod = (mainData: any, inputData: string) => {
  const query = inputData?.toLowerCase().trim() || "";
  if (!query || !Array.isArray(mainData)) return mainData;

  return mainData.filter((item: any) => {
    if (!item?.data || typeof item.data !== "object") return false;
    return Object.entries(item.data).some(([_, val]) => {
      if (typeof val === "string" || typeof val === "number") {
        return String(val).toLowerCase().includes(query);
      }
      return false;
    });
  });
};
