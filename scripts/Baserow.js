class Table {
    constructor(table_id){
        this.auth = `Token yGfiMmcSdFgOvD9TJjbEueSiMEkHFegC`
        this.base = "https://api.baserow.io"
        this.id = table_id
    }
    
    async fetch(uri, params = {}){
        const method = params.method
        const body = params.body
        
        const request = await fetch(uri, {
            method,
            headers: {
                "Authorization": this.auth,
                "Content-Type": "application/json"
            },
            body: body ? JSON.stringify(body) : null
        })
        
        try {
            return await request.json()
        } catch(e){
            return await request
        }
    }
    
    makeRequestURL(params = {}){
        if(!this.id) return
        const row_id = params.row_id || null        
        const query = params.query || {
            user_field_names: true,
        }
        
        const queryString = Object.entries(query).map(entry => {
            const [key, value] = entry
            return `${key}=${value}`
        }).join('&')
        const endpoint = row_id == null 
        ? `api/database/rows/table/${this.id}/?${queryString}`
        : `api/database/rows/table/${this.id}/${params.row_id}/?${queryString}`
        
        const url = this.base + '/' + endpoint
        
        return url
    }
    
    async request(params = {}){
        if(!this.id) return
        return await this.fetch(this.makeRequestURL(params), params)
    }
    
    async get(row_id = null){
        if( row_id) return this.request({ row_id })
            else return (await this.request()).results
    }
    
    async getByUserId(id, key = 'Usuarios', filter = 'link_row_has'){
        if(!id) return
        else return await courses.request({
            query: {
                user_field_names: true,
                [`filter__${key}__${filter}`]: id
            }
        })
    }
    
    async take(size){
        return (await this.request({
            query: {
                user_field_names: true,
                size
            }
        })).results
    }
    
    create(body = {}){
        return this.request({
            method: 'POST',
            body
        })
    }
    
    update(id, body){
        return this.request({
            row_id: id,
            method: 'PATCH',
            body,
            query: {
                user_field_names: true
            }
        })
    }
    
    delete(id){
        return this.request({
            row_id: id,
            method: 'DELETE'
        })
    }
}

export const courses = new Table('714529')
export const lessons = new Table('714537')
export const testimonials = new Table('759955')
export const gallery = new Table('759992')
export const faq = new Table('781420')
export const profiles = (token) => {
    const table = new Table('794809')
    table.auth = `Bearer ${token}`
    table.base = 'https://seqolypxaaqyrwzcwktp.supabase.co/functions/v1/baserow/'
    return table
}