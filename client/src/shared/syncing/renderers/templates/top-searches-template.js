export const topSearchesTemplate = `
<nav class="nav d-flex justify-content-between">
    <% for (var i = 0; tags.length> 0 && i < tags.length && i < 10 ; i++) { %>
        <a href="/keyword/<%=tags[i].tag %>" class="p-2 link-secondary"><%=tags[i].tag %></a>
    <% }%>
</nav>
`