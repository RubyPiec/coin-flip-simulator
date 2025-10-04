let isHeads = false //1 = Heads, 0 = Tails
let flips = 0

let headCount = 0
let tailCount = 0
let sideCount = 0

let recentFlips = []
let recentflipcount;

let graphOn = false;

let customsides = ["Heads", "Tails", "Side", "4", "5", "6", "7", "8", "9", "10"]
let sideweights = [4999, 4999, 2, 1, 1, 1, 1, 1, 1, 1]
let totalweight = 0;

function cpl(count){ //check plural
    return count == 1 ? '' : 's'
}

const ctx = document.getElementById('graph');
let chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: "Heads %",
            data: []
        },
        {
            label: "Tails %",
            data: []
        }]
    },
    options: {
		scales: {
			x: {
				type: 'linear',
				position: 'bottom'
			}
		},
        responsive: false
	}
});


function flip(){
    recentflipcount = Number(document.getElementById("flipamount").value)
    if(graphOn && recentflipcount>10000){
        if(!confirm("The amount of coins you'd like to flip is looking awfully high, and may be very laggy... are you sure you still want to do this?")){
            return;
        }
    } else{
        if(recentflipcount > 1000000){
            if(!confirm("The amount of coins you'd like to flip is looking awfully high, and may be very laggy... are you sure you still want to do this?")){
                return;
            }
        }
    }
    recentFlips = []
    for(i=1;i<=recentflipcount;i++){
        randnum = Math.random()
        if(document.getElementById("ideal").checked){
            flips++
            idealFlip()
        } else if(document.getElementById("realistic").checked){
            flips++
            realisticFlip()
        } else{
            //I'm not counting custom flips towards the total because uhh yeah i dont feel like it ig
            customFlip()
        }
    }
    if(graphOn){
        chart.update();
    }
    update()
}

function update(){
    document.getElementById("flipamount").value=document.getElementById("flipamount").value.replace(/\D/g, '')
    if(!document.getElementById("custom").checked){
        document.getElementById("customsettings").classList.add("custom")
        if(flips>0){
            if(recentflipcount==1){
                let coindir = recentFlips[0]
                if(randnum>=1/6000){
                    document.getElementById("coindirection").innerHTML = `Your coin landed on ${coindir}`
                } else{
                    document.getElementById("coindirection").innerHTML = "Your coin landed... on its side? Impressive."
                }
            } else{
                let rfH = recentFlips.filter(x => x=='Heads').length
                let rfT = recentFlips.filter(x => x=='Tails').length
                let rfs = recentFlips.filter(x => x=='side').length
                let newstr = "Your coin landed on "
                if(rfH){
                    newstr+=`Heads ${rfH} time${cpl(rfH)}`
                    if(rfT&&!rfs){
                        newstr+=` and Tails ${rfT} time${cpl(rfT)}`
                    } else if(rfs&&!rfT){
                        newstr+=` and on its side ${rfs} time${cpl(rfs)}`
                    } else if (rfs && rfT){
                        newstr+=`, Tails ${rfT} time${cpl(rfT)}, and on its side ${rfs} time${cpl(rfs)}`
                    }
                } else{
                    if(rfT){
                        newstr+=`Tails ${rfT} time${cpl(rfT)}`
                        if(rfs){
                            newstr+=` and on its side ${rfs} time${cpl(rfs)}`
                        }
                    } else{
                        if(rfs){
                            newstr+=`its side ${rfs} time${cpl(rfs)}`
                        }
                    }
                }  
                // document.getElementById("coindirection").innerHTML = `Your coin landed on Heads ${rfH} times, Tails ${rfT} times, and on its side ${rfs} times.`
                document.getElementById("coindirection").innerHTML = newstr
            }
            document.getElementById("flips").innerHTML = `This is your ${numToOrdinal(flips)} flip.`

            document.getElementById("counts").innerHTML = `You have flipped Heads ${headCount} time${cpl(headCount)}.\nYou have flipped Tails ${tailCount} time${cpl(tailCount)}. ${sideCount > 0 ? 'Your coin has landed on its side ' + sideCount + ' time' + cpl(sideCount) + '.' : ''}\n\n${Math.round(100*headCount/flips)}% Heads\n${Math.round(100*tailCount/flips)}% Tails`
        }
    } else{
        document.getElementById("customsettings").classList.remove("custom")
        totalweight=0

        for(k=0;k<Number(document.getElementById("csides").value);k++){
            sideweights[k]=Number(document.getElementById("weight"+k).value)
            totalweight+=sideweights[k]
        }
        if(recentFlips.length>0){
            let grouped = Object.groupBy(recentFlips, x => x)
            let counts = Object.fromEntries(Object.entries(grouped).map(([key, values]) => [key, values.length]))
            console.log(counts)
            let newstr = "Your 'coin' landed on "
            for(i in Object.entries(counts)){
                let [side, amount] = Object.entries(counts)[i]
                if(i!=Object.entries(counts).length-1){
                    newstr+=`${side} ${amount} time${cpl(amount)}, <br>`
                } else{
                    newstr+=`and ${side} ${amount} time${cpl(amount)}.`
                }
            }
            document.getElementById("coindirection").innerHTML = newstr
        }
    }
    //i am so sorry for this code i promise i would never do this if i was working with someone else. please hire me future employers thank you
}

let csides = 3;
function updatechances(){
    csides = document.getElementById("csides").value
    document.getElementById("csides").value=csides.replace(/\D/g, '')
    csides = document.getElementById("csides").value
    document.getElementById("csides").value=Math.max(Math.min(csides,10),1) // traps number between 1 and 10
    csides = Number(document.getElementById("csides").value)

    let chancelist = ""
    for(i=1;i<=csides;i++){
        chancelist+=`
        <span>
            <input id="name${i-1}" style="width:20%;" value="${customsides[i-1]}" oninput="updatechance(${i-1},0)">
            <label>Name&nbsp;&nbsp;&nbsp;Weight</label>
            <input id="weight${i-1}" style="width:20%;" value="${sideweights[i-1]}" oninput="updatechance(${i-1},1)">
        </span>
        `
    }
    document.getElementById("chances").innerHTML = chancelist
}

function updatechance(chance,type){ //0 is name, 1 is weight
    document.getElementById("weight"+chance).value = document.getElementById("weight"+chance).value.replace(/\D/g, '')

    if(type==0){
        customsides[chance]=document.getElementById("name"+chance).value
    } else{
        sideweights[chance]=Number(document.getElementById("weight"+chance).value)
    }
    // update()
}

let randnum = Math.random() //global variable plz
function realisticFlip(){
    // the chance of a coin landing the same way it started is around 50.8%
    if(randnum<=0.508){
        if(randnum<=1/6000){ // the chance of a US nickel landing on its side is 1 in 6000, which I'd also like to add. 
            sideCount++
            recentFlips.push('side')
        }
    } else{
        isHeads = !isHeads
    }
    if(randnum>1/6000){
        if(isHeads){
            recentFlips.push('Heads')
            headCount++
        } else{
            recentFlips.push('Tails')
            tailCount++
        }
    }
    if(graphOn){
        chart.data.datasets[0].data.push([flips,headCount/flips*100])
        chart.data.datasets[1].data.push([flips,tailCount/flips*100])
    }
}
// sources for both comments in this function are in the wikipedia page https://en.wikipedia.org/wiki/Coin_flipping

function idealFlip(){
    if(randnum<0.5){
        recentFlips.push('Heads')
        headCount++
    } else{
        recentFlips.push('Tails')
        tailCount++
    }
    if(graphOn){
        chart.data.datasets[0].data.push([flips,headCount/flips*100])
        chart.data.datasets[1].data.push([flips,tailCount/flips*100])
    }
}

function customFlip(){
    if(graphOn){
        graphOn = !graphOn
        document.getElementById("graphdiv").classList.toggle("graph")
    }
    let startnum = Math.ceil(Math.random()*totalweight)
    for(n=0;n<csides;n++){
        startnum-=sideweights[n]
        if(startnum<=0){
            recentFlips.push(customsides[n])
            return;
        }
    }
    //tomorrow maybe add the counts?
}

function numToOrdinal(num){
    // this is gonna get messy
    if(String(num).slice(-1)==='1' && num!=11){
        return num+'st'
    }
    if(String(num).slice(-1)==='2' && num!=12){
        return num+'nd'
    }
    if(String(num).slice(-1)==='3' && num!=13){
        return num+'rd'
    }
    return num+'th'
}

function togglegraph(){
    graphOn = !graphOn
    document.getElementById("graphdiv").classList.toggle("graph")
}

function togglemenu(){
    document.getElementById("simulator").classList.toggle("opened")
    document.getElementById("sidebar").classList.toggle("opened")
    document.getElementById("sidebararrow").classList.toggle("opened")
    if(document.getElementById("sidebararrow").src.includes("arrow_left")){
        document.getElementById("sidebararrow").src="arrow_right.png"
    } else{
        document.getElementById("sidebararrow").src="arrow_left.png"
    }
}

window.onload = function(){update();}