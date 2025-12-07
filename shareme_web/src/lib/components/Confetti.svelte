<script lang="ts">
    import { onMount } from 'svelte';
    
    export let show = false;
    export let duration = 3000;
    
    let particles: Array<{
        x: number;
        y: number;
        rotation: number;
        color: string;
        size: number;
        velocityX: number;
        velocityY: number;
        rotationSpeed: number;
    }> = [];
    
    const colors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];
    
    function createParticles() {
        particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * 100,
                y: -10,
                rotation: Math.random() * 360,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 10 + 5,
                velocityX: (Math.random() - 0.5) * 3,
                velocityY: Math.random() * 2 + 2,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }
    }
    
    function animateParticles() {
        if (!show) return;
        
        particles = particles.map(p => ({
            ...p,
            x: p.x + p.velocityX,
            y: p.y + p.velocityY,
            rotation: p.rotation + p.rotationSpeed,
            velocityY: p.velocityY + 0.1 // gravity
        })).filter(p => p.y < 110); // remove particles that fall off screen
        
        if (particles.length > 0) {
            requestAnimationFrame(animateParticles);
        }
    }
    
    $: if (show) {
        createParticles();
        animateParticles();
        setTimeout(() => {
            show = false;
        }, duration);
    }
</script>

{#if show}
    <div class="confetti-container">
        {#each particles as particle (particle)}
            <div
                class="confetti-particle"
                style="
                    left: {particle.x}%;
                    top: {particle.y}%;
                    background-color: {particle.color};
                    width: {particle.size}px;
                    height: {particle.size}px;
                    transform: rotate({particle.rotation}deg);
                "
            ></div>
        {/each}
    </div>
{/if}

<style>
    .confetti-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
        overflow: hidden;
    }
    
    .confetti-particle {
        position: absolute;
        border-radius: 2px;
        opacity: 0.9;
    }
</style>
