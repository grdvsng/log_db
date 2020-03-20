var BasicDestroyEffects = (function()
{
    function BasicDestroyEffects(effectName)
    {
        return this[effectName]();
    }

    return BasicDestroyEffects;
})();