export const topDivsTemplate = `
<nav class="nav d-flex justify-content-between">
    <% for (var i = 0; tags.length> 0 && i < tags.length && i < 15 ; i++) { %>
        <a href="/tag/<%=tags[i].tag %>" class="p-2 link-secondary"><%=tags[i].tag %></a>
    <% }%>
</nav>
`