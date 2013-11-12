## DB Tables
User
    id:(pk)
    email(unique)
    name(string)
    password:(hash)

CodeSnippet
    id:(pk)
    title:(string)
    code:(string)
    is_deleted:(boolean)