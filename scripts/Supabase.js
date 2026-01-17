import { createClient } from '@supabase/supabase-js'
import { profiles, courses } from './Baserow'
import config from './config'

const supabase = createClient(config.supabase.url, config.supabase.anon_key)

export class Auth {
    async login(email, password){
        const {data, error} = await supabase.auth.signInWithPassword({ email, password })
        return error || data
    }
    
    async logout(){
        await supabase.auth.signOut();
    }
    
    async signUp(name, email, password){
        const { data, error } = await supabase.auth.signUp({ email, password, options: {
            data: { name }
        } })
        console.log(data.user)
        return error || data
    }
    
    async recoverPassword(email){
        const { data, error } = await supabase.auth.resetPasswordForEmail(email)
        return error || data
    }    
}

export class User {
    constructor(){
        this.loading = true
        this.authenticated = false
    }
    
    async init(){
        this.data = await this.get()
        if(this.data){
            this.id = await this.data?.id 
            this.profile = await this.getProfile()
            this.courses = await this.getCourses()
            this.certifications = await this.getCertifications()
            this.authenticated = true
        } else {
            this.profile = null
            this.courses = null
            this.certifications = null
        }
        this.loading = false
        return this
    }
    
    /*
    async getBaserow(api, params = {}){
    const { data: { session : { access_token: token } } } = await supabase.auth.getSession();
    
    const baserow = new Baserow(token)
    baserow.base = 'https://seqolypxaaqyrwzcwktp.supabase.co/functions/v1/baserow/'
    baserow.auth = () => `Bearer ${token}`
    return baserow
    const users = new Table('794809', baserow)
    }
    */
    
    async function(api){
        const { data: { session : { access_token: token } } } = await supabase.auth.getSession();
        const endpoint = `https://seqolypxaaqyrwzcwktp.supabase.co/functions/v1/${api}`
        
        const res = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        const data = await res.json();
        return data
    }
    
    async get(){
        const { data: { user }, error } = await supabase.auth.getUser()
        if(error) return null
        return user
    }
    
    async hasCourse(id){
        const courses = await user.profile['Cursos Adquiridos'].map(c => c.id)
        return courses.includes(id)
    }
    
    async getCourses(){
        if(!this.profile?.id) return []
        return (await courses.getByUserId(this.profile.id)).results
    }

    async getCertifications(){
        if(!this.profile?.id) return []
        return await courses.getByUserId(this.profile.id, 'Certificados')
    }


    async getProfile(){
        const { data: { session: {access_token} }, error } = await supabase.auth.getSession();
        const users = profiles(access_token)     

        const profile = await users.request({
            query: {
                user_field_names: true,
                filter__supabase_id__equal: this.id
            }
        })
        
        if(profile.results.length > 0){
            return profile.results[0]
        } else {
            const request = await users.request({
                method: 'POST',
                body: {
                    supabase_id: this.id,
                    Nome: this.data.user_metadata.name
                }
            })
            return request
        }
    }
    
    async authenticated(){
        return !(await this.get() instanceof Error)
    }
    
    async update(data){
        const { result, error } = await supabase.auth.updateUser({ data })
        return error || result
    }
    
    static async login(email, password){
        const {data, error} = await supabase.auth.signInWithPassword({ email, password })
        return error || data
    }
    
    async logout(){
        await supabase.auth.signOut();
    }
    
    async signUp(name, email, password){
        const { data, error } = await supabase.auth.signUp({ email, password })
        const users = new Table('794809', this.baserow)
        if(!error) {
            users.create({
                "supabase_id": this.id,
                "Nome": name
            })
        }
        return error || data
    }
    
    async recoverPassword(email){
        const { data, error } = await supabase.auth.resetPasswordForEmail(email)
        return error || data
    }
}

export const user = new User()
export const auth = new Auth()