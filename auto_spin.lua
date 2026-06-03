--[[
    AutoSpin
    --------
    Repeatedly triggers a game's "spin" remote until a target item/style is
    obtained, a maximum number of spins is reached, or the script is stopped.

    Configure the CONFIG table below before running.

    NOTE: Client-side automation like this generally violates the Roblox Terms
    of Use and can result in account moderation. Only use it on a game/account
    where you have permission to automate.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local LocalPlayer = Players.LocalPlayer

----------------------------------------------------------------------
-- CONFIG
----------------------------------------------------------------------
local CONFIG = {
    SPIN_DELAY    = 0.5,                                  -- seconds between spins
    MAX_SPINS     = 0,                                    -- 0 = unlimited
    TARGET_STYLES = {},                                   -- e.g. { "Galaxy", "Rainbow" }; empty = no auto-stop
    MANUAL_REMOTE = nil,                                  -- set a RemoteEvent/RemoteFunction to skip auto-detection
    REMOTE_KEYWORDS = { "luckyspin", "spin", "roll", "gacha", "wheel" },
    INV_CONTAINERS  = { "Inventory", "Styles" },          -- child names to search for owned styles
}

----------------------------------------------------------------------
-- Remote detection
----------------------------------------------------------------------
local function findSpinRemote()
    if CONFIG.MANUAL_REMOTE then
        return CONFIG.MANUAL_REMOTE
    end

    -- Prefer the most specific keyword match (earlier keywords win).
    local best, bestRank
    for _, obj in ipairs(ReplicatedStorage:GetDescendants()) do
        if obj:IsA("RemoteEvent") or obj:IsA("RemoteFunction") then
            local name = obj.Name:lower()
            for rank, kw in ipairs(CONFIG.REMOTE_KEYWORDS) do
                if name:find(kw, 1, true) then
                    if not bestRank or rank < bestRank then
                        best, bestRank = obj, rank
                    end
                    break
                end
            end
        end
    end
    return best
end

local spinRemote = findSpinRemote()
if not spinRemote then
    warn("[AutoSpin] couldn't find a spin remote. Set CONFIG.MANUAL_REMOTE manually.")
    return
end
print("[AutoSpin] using remote:", spinRemote:GetFullName())

----------------------------------------------------------------------
-- Spin + target detection
----------------------------------------------------------------------
local function doSpin()
    if spinRemote:IsA("RemoteEvent") then
        spinRemote:FireServer()
    else
        return spinRemote:InvokeServer()
    end
end

local function hasTargetStyle()
    if #CONFIG.TARGET_STYLES == 0 then
        return false
    end
    for _, containerName in ipairs(CONFIG.INV_CONTAINERS) do
        local inv = LocalPlayer:FindFirstChild(containerName)
        if inv then
            for _, want in ipairs(CONFIG.TARGET_STYLES) do
                if inv:FindFirstChild(want) then
                    return true, want
                end
            end
        end
    end
    return false
end

----------------------------------------------------------------------
-- Main loop
----------------------------------------------------------------------
local spins = 0
print("[AutoSpin] started.")
while true do
    local got, styleName = hasTargetStyle()
    if got then
        print(("[AutoSpin] target style %q obtained after %d spins. stopping."):format(styleName, spins))
        break
    end

    if CONFIG.MAX_SPINS > 0 and spins >= CONFIG.MAX_SPINS then
        print(("[AutoSpin] reached max of %d spins. stopping."):format(CONFIG.MAX_SPINS))
        break
    end

    local ok, err = pcall(doSpin)
    if ok then
        spins += 1
        if spins % 10 == 0 then
            print(("[AutoSpin] %d spins done"):format(spins))
        end
    else
        warn("[AutoSpin] spin failed:", err)
    end

    task.wait(CONFIG.SPIN_DELAY)
end
