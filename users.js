class userControl{
    constructor(){
        this.users={};
        this.pk="name";
        this.unvalidpk=["null","false","true","False","True","admin","Null",'RandomBot'];
        this.requiredFields={isactive:true,socketid:"",gameMode:["FFA"]};
    }

    exists(key,value){
        let ans=false;
        Object.keys(this.users).forEach((pk)=>{
            if(!ans && value==this.users[pk][key]){
                ans = pk;
            }
        });
        return ans;
    }

    checkpk(pk){
        if(!pk || typeof(pk)!="string" || pk.slice(-5)=="(Bot)"){
            return false;
        }
        let ans=true;
        this.unvalidpk.forEach((unvalidpk)=>{
            if(ans && unvalidpk==pk.slice(0,unvalidpk.length)){
                ans = false;
            }
        })
        return ans;
    }

    get(primarykey){
        return this.users[primarykey];
    }

    addUser(user){
        let userpk=user[this.pk];

        if(!this.checkpk(userpk) || this.exists(this.pk,user[this.pk])){
            return false;
        };

        Object.keys(this.requiredFields).forEach((rkey)=>{
            if(!(rkey in user)){
                user[rkey]=this.requiredFields[rkey];
            };
        });
        
        this.users[userpk]=user;
        console.log("===== New User =====");
        console.log(user);
        return user;
    }
    
    delUser(key,value){
        let pk = ((key == this.pk) ? key : this.exists(key,value));
        if(pk && pk in this.users){
            return (delete this.users[pk]);
        }
        return false
    }
};

module.exports = userControl;