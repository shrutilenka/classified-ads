export const topDivsTemplate = `
    <% for (var i = 0; tags.length> 0 && i < tags.length && i < 10 ; i++) { %>
        <a href="/tag/<%=tags[i].tag %>" class="badge badge-info"><%=tags[i].tag %></a>
    <% }%>    
`