export const topTagsTemplate = `
    <% for (var i = 0; tags.length> 0 && i < tags.length && i < 10 ; i++) { %>
        <div><%=tags[i]._id.tags %></div>
    <% }%>
`