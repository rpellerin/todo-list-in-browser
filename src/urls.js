const urlRegex = /(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?/gi;

export const addLinkTags = (string) =>
  string.replace(urlRegex, '<a href="$&" target="_blank">$&</a>');
