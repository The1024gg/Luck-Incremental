var player = {}, date = Date.now(), diff = 0;

function loop() {
    diff = Date.now() - date
    updateTemp()
    updateHTML()
    calc(diff/1000);
    date = Date.now();
}

const MAIN = {
    prestige: {
        gain() {
            let r = player.max_rarity.sub(15)
            if (r.lt(0)) return E(0)
            let x = Decimal.pow(1.1,r).mul(r.add(1))

            x = x.mul(upgradeEffect('tp',1)).mul(upgradeEffect('rp',1)).mul(upgradeEffect('ap',1)).mul(upgradeEffect('es',1)[1])

            return x.floor()
        },
        reset() {
            if (player.max_rarity.gte(15)) {
                player.pp = player.pp.add(tmp.ppGain)
                player.pTimes++

                this.doReset()
            }
        },
        doReset() {
            player.randomizers = []
            player.rarity_progress = E(0)
            player.max_rarity = E(0)
            player.roll_time = 0

            NGM.aura_ch = "green"
            NGM.temp_reload = 1
        },
    },
    trans: {
        gain() {
            let r = player.max_rarity.sub(100)
            if (r.lt(0)) return E(0)
            r = r.add(1).root(2)
            let x = Decimal.pow(1.1,r).mul(r.add(1)).mul(player.pp.div(1e8).max(1).root(2))
            
            x = x.mul(upgradeEffect('rp',2)).mul(upgradeEffect('ap',2)).mul(upgradeEffect('es',3)[1])

            return x.floor()
        },
        reset() {
            if (player.max_rarity.gte(100)) {
                player.tp = player.tp.add(tmp.tpGain)
                player.tTimes++

                this.doReset()
            }
        },
        doReset() {
            player.pp = E(0)
            resetUpgrades('pp',hasUpgrade('es',2)?[1,6]:[])

            MAIN.prestige.doReset()
        },
    },
    rein: {
        gain() {
            let r = player.max_rarity.sub(300)
            if (r.lt(0)) return E(0)
            r = r.add(1).root(2)
            let x = Decimal.pow(1.1,r).mul(r.add(1)).mul(player.tp.div(1e9).max(1).root(3))

            x = x.mul(upgradeEffect('ap',3)).mul(upgradeEffect('es',4)[1])

            return x.floor()
        },
        reset() {
            if (player.max_rarity.gte(300)) {
                player.rp = player.rp.add(tmp.rpGain)
                player.rTimes++

                this.doReset()
            }
        },
        doReset() {
            player.tp = E(0)
            resetUpgrades('tp', hasUpgrade('es',2)?[6]:[])

            MAIN.trans.doReset()
        },
    },
    asce: {
        gain() {
            let r = player.max_rarity.sub(24000)
            if (r.lt(0)) return E(0)
            r = r.div(40)
            let x = r.add(1).mul(player.rp.log10().div(600).pow(2).max(1))
			
			x = x.mul(upgradeEffect('pp',7)).mul(upgradeEffect('ap',4)).mul(upgradeEffect('es',13))

            return x.floor()
        },
        reset() {
            if (player.max_rarity.gte(24000)) {
                player.ap = player.ap.add(tmp.apGain)
                player.aTimes++

                this.doReset()
            }
        },
        doReset() {
            player.rp = E(0)
            resetUpgrades('rp', hasUpgrade('es',2)?[3,4]:[])

            MAIN.rein.doReset()
        },
    },
    mastery: {
        req() {
			if(player.mastery_tier==0)return 777;
				
            let x = 500 + 600 * player.mastery_tier;

			if(player.mastery_tier>=10)x = 600 * player.mastery_tier + 5 * (player.mastery_tier**2);
			if(player.mastery_tier>=20)x = 35 * (player.mastery_tier**2);
			if(player.mastery_tier>=35)x = player.mastery_tier**3;
			
            return x
        },
        reset() {
            if (player.max_rarity.gte(tmp.mTierReq)) {
                player.mastery_tier++
				resetUpgrades('ap', hasUpgrade('es',2)?[]:[])
				
                this.doReset()
            }
        },
        doReset() {
            player.ap = E(0)

            MAIN.asce.doReset()
        },
        effect() {
            let t = player.mastery_tier

            let x = Math.pow(t+1,1/3)

            let y = Decimal.pow(10,t-1).mul(t)

            return {luck: x, gen: y}
        },
        essGain() {
            let x = tmp.mTierEff.gen.mul(upgradeEffect('pp',4)).mul(upgradeEffect('tp',7)).mul(upgradeEffect('es',7)).mul(upgradeEffect('ap',5))

            return x
        },
    },
}

el.update.main = ()=>{
    if (tab == 1) {
        tmp.el.pres_btn.setClasses({locked: tmp.ppGain.lt(1), pres_btn: true})

        tmp.el.pres_btn.setHTML(`
        (Require ${getRarityName(15).bold()})<br>
        Prestige for ${tmp.ppGain.format(0).bold()} Prestige Points
        `)

        tmp.el.tran_btn.setDisplay(player.pTimes>0)
        tmp.el.tran_btn.setClasses({locked: tmp.tpGain.lt(1), pres_btn: true})

        tmp.el.tran_btn.setHTML(`
        (Require ${getRarityName(100).bold()})<br>
        Transcend for ${tmp.tpGain.format(0).bold()} Trancension Points
        `)

        tmp.el.rein_btn.setDisplay(player.tTimes>0)
        tmp.el.rein_btn.setClasses({locked: tmp.rpGain.lt(1), pres_btn: true})

        tmp.el.rein_btn.setHTML(`
        (Require ${getRarityName(300).bold()})<br>
        Reincarnate for ${tmp.rpGain.format(0).bold()} Reincarnation Points
        `)

        tmp.el.asce_btn.setDisplay(player.rTimes>0)
        tmp.el.asce_btn.setClasses({locked: tmp.apGain.lt(1), pres_btn: true})

        tmp.el.asce_btn.setHTML(`
        (Require ${getRarityName(24000).bold()})<br>
        Ascend for ${tmp.apGain.format(0).bold()} Ascension Points
        `)
    } else if (tab == 2) {
        tmp.el.mastery_btn.setClasses({locked: player.max_rarity.lt(tmp.mTierReq), pres_btn: true})

        tmp.el.mastery_btn.setHTML(`
        (Require ${getRarityName(tmp.mTierReq).bold()})<br>
        Evolve Master Tier to <b>${format(player.mastery_tier+1,0)}</b>
        `)

        tmp.el.mastery_tier.setDisplay(player.mastery_tier>0)

        if (player.mastery_tier>0) {
            tmp.el.mastery_tier.setHTML(
                `Your Mastery Tier is <h3>${format(player.mastery_tier,0)}</h3>, which boosts luck by ^<h3>${format(tmp.mTierEff.luck)}</h3> and generates <h3>${tmp.essGain.format()}</h3> Mastery Essence every second.`
            )
        }
    }

    // Luck Multiplier
    tmp.el.luck_mult.setHTML(formatMult(tmp.luckMult)+" luck")
}

tmp_update.push(()=>{
    tmp.ppGain = MAIN.prestige.gain()
    tmp.tpGain = MAIN.trans.gain()
    tmp.rpGain = MAIN.rein.gain()
    tmp.apGain = MAIN.asce.gain()

    tmp.mTierReq = MAIN.mastery.req()
    tmp.mTierEff = MAIN.mastery.effect()

    tmp.essGain = MAIN.mastery.essGain()
})